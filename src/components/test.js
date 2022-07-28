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



// foreach 顺序, 根据时间顺序一次log 请求发送和resolve
async function FOR_TEST() {
  for (var i = 0; i < test.length; i++) {
    let res = await mockPromise(test[i])
    console.log('for log', res)
  }
}
// FOR_TEST()
function FOR_EACH() {
  test.forEach(async e => {
    const res = await mockPromise(e)
    console.log('resolve，time=', e)
  })
}
FOR_EACH()

// foreach 顺序, 先log所有的请求发送，在根据时间顺序log请求的resolve
async function FOR_EACH_TEST() {
  let requests = []
  requests = test.map(async (e) => {
    // return await mockPromise(e)
    return mockPromise(e).then(res => {
      console.log('进度增加', res)
    })
  })
  console.log('before type=', requests instanceof Array);
  return requests;
}

async function testFn() {
  let requests = FOR_EACH_TEST()
  console.log('after type=', requests instanceof Array);
  console.log('requests', requests)
  // console.log('requests', requests)
  // requests.then(res => {
  //   console.log(typeof requests, '>>>====', requests)
  // })
  // Promise.all(requests).then(res => {
  //   console.log('Promise.all', res)
  // })
  // Promise.all([requests[1], requests[2], requests[3]]).then(res => {
  //   console.log('Promise.all', res)
  // })
}

// testFn()
function testP() {
  return [1000, 1000, 1000].map(async e => (await mockPromise(e)))
}
function testP3() {
  let P1 = testP();
  console.log(P1)
}
// testP3()
async function testP2() {
  let P1 = testP()
  console.log('/// type=>', P1 instanceof Array);
  console.log('P1=>', P1);
  Promise.all(P1).then(res => {
    console.log('resres=>', res);
  })
};
// testP2()

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