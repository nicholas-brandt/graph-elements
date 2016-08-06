import fs from "fs";
import esprima from "esprima";
export
default class StaticAnalysis {
    static analyze(code) {
        const tree = esprima.parse(code);
        console.log(tree);
        const scopes = new Set;
        Scope.discover(tree, scopes);
        return scopes;
    }
    static analyzeFile(path) {
        return StaticAnalysis.analyze(fs.readFileSync(path).toString());
    }
};
class Scope {
    constructor(name) {
        Object.defineProperties(this, {
            name: {
                value: name,
                enumerable: true
            },
            accessing: {
                value: new Set,
                enumerable: true
            }
        });
    }
    static resolveAddress(object) {}
    static discover(root, scopes, scope, member) {
        console.log("discover", root.type);
        // create new scope for BlockStatements
        let _scope;
        if (!scope || root.type == "BlockStatement") {
            _scope = new Scope("anonymous");
            scopes.add(_scope);
        } else {
            _scope = scope;
        }
        // iterate over bodies
        if (root.body) {
            if (Array.isArray(root.body)) {
                for (let body_part of root.body) {
                    Scope.discover(body_part, scopes, _scope);
                }
            } else {
                Scope.discover(root.body, scopes, _scope);
            }
        }
        // encounter variables
        if (root.expression) {
            Scope.discover(root.expression, scopes, _scope);
        }
        if (root.expressions) {
            for (let expression of root.expressions) {
                Scope.discover(expression, scopes, _scope);
            }
        }
        // declarations
        if (root.declarations) {
            for (let declaration of root.declarations) {
                Scope.discover(declaration, scopes, _scope);
            }
        }
        // declarator
        if (root.type.endsWith("Declarator")) {
            _scope.accessing.add(root.id.name);
            Scope.discover(root.init, scopes, _scope);
        }
        // is identifier
        if (root.name) {
            console.log("root.name", root.name, "in", root.type);
            if (member) {
                return root.name;
            } else {
                _scope.accessing.add(root.name);
            }
        }
        // memberexpressions
        if (root.type == "MemberExpression") {
            const name = Scope.discover(root.object, scopes, _scope, true) + "." + Scope.discover(root.property, scopes, _scope, true);
            if (member) {
                return name;
            } else {
                _scope.accessing.add(name);
            }
        }
        // assignments
        if (root.type == "AssignmentExpression") {
            Scope.discover(root.left, scopes, _scope);
            Scope.discover(root.right, scopes, _scope);
        }
    }
}

function search(node) {
    switch (node.type) {
        case "Identifier":
            return node.name;
        case "MemberExpression":
            return search(node.object) + "." + search(node.property);
        case "ArrowFunctionExpression":
            
            return "{{ArrowFunctionExpression}}";
    }
}