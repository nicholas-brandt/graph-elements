//import fs from "fs";
import esprima from "../../../node_modules/esprima/esprima.js";
export default class StaticAnalysis {
    static analyze(code) {
        const tree = esprima.parse(code);
        const scope = new Scope;
        scope.discover(tree);
        return scope;
    }
    /*
    static analyzeFile(path) {
        return StaticAnalysis.analyze(fs.readFileSync(path).toString());
    }
    */
};
class Scope {
    constructor(parent, weak = true) {
        Object.defineProperties(this, {
            declarations: {
                value: new SerializableSet,
                enumerable: true
            },
            accesses: {
                value: new SerializableSet,
                enumerable: true
            },
            literals: {
                value: new SerializableSet,
                enumerable: true
            },
            scopes: {
                value: new SerializableSet,
                enumerable: true
            },
            parent: {
                value: parent instanceof Scope ? parent : null
            },
            weak: {
                value: !!weak,
                enumerable: true
            }
        });
    }
    discover(node, declaration) {
        if (!node) {
            // missing alternate statment
            return;
        }
        // console.log("discover", node);
        if (Array.isArray(node)) {
            for (const part of node) {
                this.discover(part);
            }
            return;
        }
        switch (node.type) {
            case "Identifier":
                if (declaration) {
                    let scope = this;
                    if (declaration == "var") {
                        while (scope.parent && scope.weak) scope = scope.parent;
                    }
                    scope.declarations.add(node.name);
                } else {
                    this.accesses.add(node.name);
                }
                break;
            case "VariableDeclaration":
                for (const declaration of node.declarations) {
                    this.discover(declaration, node.kind);
                }
                break;
            case "VariableDeclarator":
                this.discover(node.id, declaration);
                this.discover(node.init);
                break;
            case "ExpressionStatement":
                this.discover(node.expression);
                break;
            case "NewExpression":
            case "CallExpression":
                this.discover(node.callee);
                for (const argument of node.arguments) {
                     this.discover(argument);
                }
                break;
            case "FunctionDeclaration":
                this.discover(node.id, "var");
            case "CatchClause":
            case "ArrowFunctionExpression":
            case "FunctionExpression": {
                const scope = new Scope(this, false);
                scope.discover(node.params);
                scope.discover(node.defaults);
                if (node.expression) {
                    // expression type arrow function
                    scope.discover(node.body);
                } else {
                    // skip inner blockstatement
                    scope.discover(node.body.body);
                }
                this.scopes.add(scope);
                break;
            }
            case "ArrayExpression":
                for (const element of node.elements) {
                    this.discover(element);
                }
                break;
            case "Literal":
                this.literals.add(node.value);
                break;
            case "ObjectExpression":
                for (const property of node.properties) {
                    this.discover(property.key);
                    this.discover(property.value);
                }
                break;
            case "ObjectPattern":
                for (const property of node.properties) {
                    this.discover(property, declaration);
                }
                break;
            case "BlockStatement": {
                const scope = new Scope(this);
                scope.discover(node.body);
                this.scopes.add(scope);
                break;
            }
            case "ForInStatement":
            case "ForOfStatement": {
                const scope = new Scope(this);
                scope.discover(node.left);
                scope.discover(node.right);
                scope.discover(node.body);
                this.scopes.add(scope);
                break;
            }
            case "ForStatement": {
                const scope = new Scope(this);
                scope.discover(node.init);
                scope.discover(node.test);
                scope.discover(node.update);
                scope.discover(node.body);
                this.scopes.add(scope);
                break;
            }
            case "WhileStatement":
            case "DoWhileStatement":
                this.discover(node.test);
                this.discover(node.body);
                break;
            case "ConditionalExpression":
            case "IfStatement":
                this.discover(node.test);
                this.discover(node.consequent);
                this.discover(node.alternate);
                break;
            case "UnaryExpression":
            case "UpdateExpression":
            case "ThrowStatement":
            case "YieldExpression":
            case "ReturnStatement":
            case "SpreadElement":
                this.discover(node.argument);
                break;
            case "LogicalExpression":
            case "BinaryExpression":
            case "AssignmentExpression":
                this.discover(node.left);
                this.discover(node.right);
                break;
            case "MemberExpression":
                this.discover(node.object);
                if (node.computed) {
                    this.discover(node.property);
                }
                break;
            case "LabeledStatement":
                this.discover(this.label);
                this.discover(this.body);
                break;
            case "ClassBody":
            case "Program":
                this.discover(node.body);
                break;
            case "SequenceExpression":
                for (let expression of node.expressions) {
                    this.discover(expression);
                }
                break;
            case "ThisExpression":
                this.accesses.add("this");
                break;
            case "TryStatement":
                this.discover(node.block);
                this.discover(node.handler);
                this.discover(node.finalizer);
                break;
            case "BreakStatement":
            case "ContinueStatement":
            case "EmptyStatement":
            case "DebuggerStatement":
                break;
            case "ClassDeclaration":
                this.discover(node.id);
                this.discover(node.superClass);
                this.discover(node.classBody);
                break;
            case "Property":
            case "MethodDefinition":
                this.discover(property.key);
                this.discover(property.value, declaration);
                break;
            default:
                console.log("ignore", node.type);
        }
    }
}

class SerializableSet extends Set {
    toJSON() {
        return [...this];
    }
}