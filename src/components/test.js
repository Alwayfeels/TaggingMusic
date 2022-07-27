const mockPromise = (time) => {
  console.log('请求发送，time=', time)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('resolve，time=', time)
      resolve(time)
    }, time)
  })
}
let test = [1000, 2000, 3000]

// foreach 顺序, 先log所有的请求发送，在根据时间顺序log请求的resolve
async function FOR_EACH_TEST() {
  test.forEach(async (e) => {
    let res = await mockPromise(e)
    console.log('进度增加', res)
  })
}

// foreach 顺序, 根据时间顺序一次log 请求发送和resolve
async function FOR_TEST() {
  for (let i = 0; i < test.length; i++) {
    let res = await mockPromise(test[i])
    console.log('for log', res)
  }
}

async function testFn() {
  await FOR_EACH_TEST()
  console.log('==============================')
}

testFn()

// FOR_TEST();
// 请求发送，time= 1000
// resolve，time= 1000
// for log 1000
// 请求发送，time= 2000
// resolve，time= 2000
// for log 2000

// FOR_EACH_TEST()
// 请求发送，time= 1000
// 请求发送，time= 2000
// resolve，time= 1000
// forEach log 1000
// resolve，time= 2000
// forEach log 2000