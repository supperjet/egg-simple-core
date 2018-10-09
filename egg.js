const { resolve, join, parse } = require("path");
const globby = require("globby");

module.exports = app => {
    const AppPath = resolve(__dirname, "app");
    const context = app["context"];
    
    const fileAbsolutePath = {
        config: join(AppPath, 'config'),
        middleware: join(AppPath, 'middleware'),
        service: join(AppPath, 'service')
    }

    Object.keys(fileAbsolutePath).forEach((v) => {
        const path = fileAbsolutePath[v];
        const prop = v; 

        // 获取路径下的所有文件
        const files = globby.sync('**/*.js', {
            cwd: path
        })

        // 将service，config,直接挂载载context上
        if(prop != "middleware") {
            context[prop] = {};  //初始化对象
        }
       
        files.forEach( file => {
            //将文件名作为key挂载在子对象上
            const filename = parse(file).name;
            // 导入文件内容
            const content = require(join(path, file));
            //config，service，middleware不同的处理逻辑

            // 1、中间件 middle
            if(prop == "middleware") {
                // 如果中间件已经配置在了config文件中, 使用app.use引入
                if(filename in context["config"]) {
                    app.use(content(context['config'][filename]));
                }
                return;
            }

            //2、挂载 config
            if(prop == "config" && content) {
                context[prop] = Object.assign({}, context[prop], content);
                return;
            }
            
            // 3、挂载 service
            if(prop == "service") {
                context[prop][filename] = content;
            }
        })
    })
}