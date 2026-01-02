# Git Commit Message Guidelines

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

## Commit Message 格式

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type (必须)

用于说明 commit 的类别，只允许使用下面几个标识：

- **feat**: 新功能 (feature)
- **fix**: 修复 bug
- **docs**: 文档改变 (documentation)
- **style**: 代码格式修改，不影响代码逻辑 (white-space, formatting, missing semi colons, etc)
- **refactor**: 重构 (即不是新增功能，也不是修改 bug 的代码变动)
- **perf**: 性能优化
- **test**: 增加测试或修改测试
- **build**: 影响构建系统或外部依赖的修改 (npm, webpack, typescript)
- **ci**: CI 配置文件或脚本的修改
- **chore**: 其他不修改 src 或 test 的修改 (构建过程或辅助工具的变动)
- **revert**: 回滚上一个 commit

### Scope (可选)

用于说明 commit 影响的范围，比如数据层、控制层、视图层等等，视项目不同而不同。

### Subject (必须)

commit 目的的简短描述，不超过 50 个字符。

- 以动词开头，使用第一人称现在时，比如 "change" 而不是 "changed" 或 "changes"
- 第一个字母小写
- 结尾不加句号 (.)

### Body (可选)

对本次 commit 的详细描述，可以分成多行。

- 使用第一人称现在时，比如 "change" 而不是 "changed" 或 "changes"
- 说明代码变动的动机，以及与以前行为的对比

### Footer (可选)

- **不兼容变动**: 如果当前代码与上一个版本不兼容，则 Footer 部分以 `BREAKING CHANGE` 开头，后面是对变动的描述、以及变动理由和迁移方法。
- **关闭 Issue**: 如果当前 commit 针对某个 issue，那么可以在 Footer 部分关闭这个 issue，例如：`Closes #123, #245`。

## 示例

```
feat(auth): add login functionality

Implement user login with email and password.
Support JWT token storage in local storage.

Closes #10
```

```
fix(button): fix click event not firing

The button click event was blocked by the overlay element.
Added z-index to ensure button is clickable.
```

```
docs: update README with installation instructions
```
