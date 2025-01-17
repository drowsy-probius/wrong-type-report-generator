import { ImportDeclarationStructure, Project, SourceFile, StructureKind } from 'ts-morph';
import { AstRootNode, Dependencies } from '../reporterAst';
import { generateBodyCode } from './generateBodyCode';
import { makeAsync } from '../utils';
import { isType } from './utils';

export type CodeGenerator = {
    astRootNode: AstRootNode;
    project: Project;
    outFilePath: string;
    inputSourceFile: SourceFile;
};

/**
 * Generate code for type guard
 *
 * @returns Promise<Generated code ts-morph sourceFile>
 */
export const codeGenerator = async ({ astRootNode, project, outFilePath, inputSourceFile }: CodeGenerator) => {
    await makeAsync();
    // Generate outfile
    const outFile = project.createSourceFile(outFilePath, undefined, {
        overwrite: true,
    });

    // import dependencies
    // TODO: can be implemented via `sourceFile.fixMissingImports()`...
    //       Should think about replacing this with that
    const { dependencies } = astRootNode;
    outFile.addImportDeclarations(
        getImportDeclarations({
            inputSourceFile,
            dependencies,
            outFile,
        }),
    );

    // generate remaining codes
    const { ast } = astRootNode;
    const pascalCasedName = ast.name[0].toUpperCase() + ast.name.slice(1);

    const code = [
        `export const validate${pascalCasedName} = (value: unknown): GeneratedWrongTypeErrorReport | undefined => {`,
        `    const typedValue = value as ${isType(ast.type) ? ast.type : ast.name};`,
        `    const error: GeneratedWrongTypeErrorReport = [];`,
        `    ${generateBodyCode({
            astNode: ast,
            nameStack: [],
            propertyChainStack: [],
            root: true,
        })}`,
        `    return error.length === 0 ? undefined : error;`,
        `}`,
    ].join('\n');

    outFile.addStatements(code);
    outFile.fixMissingImports();
    process.env.NODE_ENV === 'production' && outFile.insertStatements(0, '// @ts-nocheck');
    outFile.insertStatements(0, '/* eslint-disable */');
    outFile.formatText();

    await outFile.save();
};

const getImportDeclarations = ({
    inputSourceFile,
    dependencies,
    outFile,
}: {
    inputSourceFile: SourceFile;
    dependencies: Dependencies;
    outFile: SourceFile;
}) => {
    /**
     * map import name to module specifier
     */
    const importsMap = new Map<string, string>();
    for (const impDeclaration of inputSourceFile.getImportDeclarations()) {
        impDeclaration.getNamedImports().forEach((impSpecifier) => {
            importsMap.set(impSpecifier.getText(), impDeclaration.getModuleSpecifierValue());
        });
    }

    const importDeclarations = Array.from(dependencies.entries()).reduce((structures, [importFile, imports]) => {
        if (outFile === importFile) {
            return structures;
        }

        let moduleSpecifier = outFile.getRelativePathAsModuleSpecifierTo(importFile);

        if (importFile.isInNodeModules()) {
            // Packages within node_modules should not be referenced via relative path
            for (const im in imports) {
                const importDeclaration = importsMap.get(im);
                if (importDeclaration) {
                    moduleSpecifier = importDeclaration;
                }
            }
        }

        const defaultImport = imports.default;
        delete imports.default;
        const namedImports = Object.entries(imports).map(([alias, name]) => (alias === name ? name : { name, alias }));
        structures.push({
            defaultImport,
            kind: StructureKind.ImportDeclaration,
            moduleSpecifier,
            namedImports,
        });
        return structures;
    }, [] as ImportDeclarationStructure[]);

    return importDeclarations;
};
