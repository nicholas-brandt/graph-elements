const {
    packages, base, config
} = require("./gulpfile.json");
const gulp = require("gulp");
const watch = require("gulp-watch");
applyPipelinePackages(packages, base);

function applyPipeline(name, src_pattern, base, dest = "build", tasks, dependency_tasks) {
    if (!name) {
        throw Error("Invalid pipeline name");
    }
    if (!src_pattern) {
        throw Error("Invalid pipeline src-pattern");
    }
    let pipeline = gulp.src(src_pattern, {
        base
    }).pipe(watch(src_pattern, {
        base
    }));
    for (const [task, options] of tasks) {
        pipeline = pipeline.pipe(require("gulp-" + task)(Object.assign({}, config[task], options)));
    }
    pipeline = pipeline.pipe(gulp.dest(dest));
    console.log("register tasks", name);
    gulp.task(name, dependency_tasks || [], () => pipeline);
}

function applyPipelinePackages(packages, base, dest) {
    const package_names = [];
    for (let package_name in packages) {
        package_names.push(package_name);
        const package = packages[package_name];
        const pipe_names = [];
        for (let pipe_name in package) {
            const pipeline = package[pipe_name];
            pipe_name = package_name + "-" + pipe_name;
            pipe_names.push(pipe_name);
            applyPipeline(pipe_name, pipeline.src, pipeline.base || base, dest, pipeline.tasks, pipeline["dependency-tasks"]);
        }
        console.log("register package", package_name);
        gulp.task(package_name, pipe_names);
    }
    gulp.task("default", package_names);
}
gulp.task("test", () => {});
gulp.on("stop", () => {
    console.log("stop");
});