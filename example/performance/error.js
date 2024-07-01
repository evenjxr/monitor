const a =  123;

console.error('我第一个我是个错误')

console.error(new SyntaxError('sadfsdf'))

console.error(new Error('我是一个error'))

console.error(new ErrorEvent('error',  {
  message: 'Something went wrong',
  filename: 'app.js',
  lineno: 42,
  colno: 15,
  error: new Error('Oops!')
}))

setInterval(function() {
  console.error(new ErrorEvent('beacon',  {
    message: 'Something went wrong',
    filename: 'app.js',
    lineno: 42,
    colno: 15,
    error: new Error('Oops!')
  }))
}, 4000)