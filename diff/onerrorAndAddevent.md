<!-- @format -->

// 变量为声明

## 普通错误

> > > onerror 返回的参数
> > > msg: 'Uncaught ReferenceError: a is not defined'
> > > source: 'http://10.171.125.108:9000/'
> > > line: Number
> > > clomn: Number
> > > event: Object

> > > addeventListener 接到的对象
> > > {
> > > isTrusted: true
> > > message: 'Uncaught ReferenceError: a is not defined'
> > > filename: 'http://10.171.125.108:9000/'
> > > lineno: 104
> > > colno: 26
> > > bubbles: false
> > > cancelBubble: false
> > > cancelable: true
> > > filename: ''
> > > srcElement: {};
> > > target: {};
> > > currentTarget: {};
> > > timeStamp: 228
> > > type: 'error'
> > > error: {

    message: '',
    stack: {}

}
}

## 加载错误

1 window.addEventListener('error', callback, true) 能接受加载错误
2 window.onerror 没有 callback

## 异步错误 setTimeout

window.addEventListener('error') 和 window.onerror 都能触发回调

## 非同源文件报错

window.addEventListener('error') 和 window.onerror 都能触发回调

## window.onerror 和 window.addEventListener('error')区别

都可以用来捕获 JavaScript 错误，但它们有一些区别：

触发时机：window.onerror 事件只能捕获未被其他代码捕获的 JavaScript 错误，而 window.addEventListener('error')可以捕获所有类型的 JavaScript 错误，包括未被其他代码捕获的错误和已被其他代码捕获但未被处理的错误。
错误信息：window.onerror 事件只能获取到错误信息、错误文件、错误行号和错误列号等基本信息，而 window.addEventListener('error')可以获取到更详细的错误信息，例如错误堆栈、错误类型等。
处理方式：window.onerror 事件只能通过返回 true 或 false 来控制错误的处理方式，而 window.addEventListener('error')可以通过 event.preventDefault()方法来阻止默认的错误处理方式，并自定义处理方式。
兼容性：window.onerror 事件在旧版本的浏览器中可能存在兼容性问题，而 window.addEventListener('error')在大多数现代浏览器中都得到了良好的支持。

综上所述，window.addEventListener('error')比 window.onerror 更加灵活和强大，可以更好地捕获和处理 JavaScript 错误。
