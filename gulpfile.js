const exec = require("child_process").exec;
const gulp = require("gulp");
const gulp_debug = require("gulp-debug");
const {
    bundles, modules
} = require("./gulpfile.json");
for (const bundle in bundles) {
    const tasks = bundles[bundle];
    const task_names = [];
    for (const task_name in tasks) {
        try {
            const task = tasks[task_name];
            // console.log(task_name);
            const direct_task = () => {
                return task_function(gulp.src(task.src));
            };
            const watch_task = () => {
                const gulp_watch = require("gulp-watch");
                return task_function(gulp_watch(task.src, modules["gulp-watch"]));
            };
            const task_function = pipe_part => {
                for (const part of task.chain) {
                    const module_name = typeof part == "string" ? part : part.module;
                    let pipe_function = require(module_name);
                    if (typeof pipe_function != "function") {
                        pipe_function = pipe_function.default;
                    }
                    const settings = Object.assign({}, part.settings, modules[module_name]);
                    pipe_part = pipe_part.pipe(pipe_function(settings));
                    pipe_part.on("error", error => console.error(error.toString()));
                }
                if (task.dest !== undefined) {
                    pipe_part = pipe_part.pipe(gulp.dest(task.dest));
                }
                return pipe_part;
            };
            const bundled_task_name = bundle + "-" + task_name;
            task_names.push(bundled_task_name);
            if (task.watch) {
                task_names.push(bundled_task_name + "-watch");
            }
            if (Array.isArray(task.dependencies) && task.dependencies.length) {
                const dependencies = task.dependencies.map(name => bundle + "-" + name);
                gulp.task(bundled_task_name, gulp.series(gulp.parallel(...dependencies), direct_task));
                if (task.watch) {
                    gulp.task(bundled_task_name + "-watch", gulp.series(gulp.parallel(...dependencies), watch_task));
                }
            } else {
                gulp.task(bundled_task_name, direct_task);
                if (task.watch) {
                    gulp.task(bundled_task_name + "-watch", watch_task);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    gulp.task(bundle, gulp.parallel(task_names));
    gulp.task("init-" + bundle, () => new Promise((resolve, reject) => {
        exec("npm install --save-dev gulp-watch " + Object.getOwnPropertyNames(modules).join(" "), error => {
            (error ? reject : resolve)();
        });
    }));
}
{
    const bundle_array = Object.getOwnPropertyNames(bundles);
    gulp.task("default", gulp.parallel(bundle_array));
    gulp.task("init", gulp.series(bundle_array.map(bundle => "init-" + bundle)));
}