// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const Mock = require('mockjs')

const TAG_NAME = 'test.js'

class Test {
  constructor() {
    this.obj = {
      cc: true,
      'flow|1': ['out', 'in'],
      'from|1': ['cjhz1', 'wangsitu1', 'cs1', 'cs2', 'cs3', 'cs4'],
      'fromClientType|1': ['Web', 'Android', 'IOS'],
      'fromDeviceId|1': [
        '2fb0d8c26d874a4790a92719a186bea0',
        '3ab0ddc2rtjk4a4790a92719o98jbAa1',
        '4ab0ddc2rtjk4a4790a92719o98jbAa1',
      ],
      'fromNick|1': ['cjhz1', 'wangsitu1', 'cs1', 'cs2', 'cs3', 'cs4'],
      idClient: /\w{32}/,
      idServer: /\d{12}/,
      isHistoryable: true,
      isLocal: false,
      isOfflinable: true,
      isPushable: true,
      isReplyMsg: true,
      isRoamingable: true,
      isSyncable: true,
      isUnreadable: true,
      needMsgReceipt: false,
      needPushNick: true,
      resend: false,
      scene: 'p2p',
      sessionId: /p2p-cs\d{3}/,
      status: 'success',
      'target|1': ['cjhz1', 'wangsitu1', 'cs1', 'cs2', 'cs3', 'cs4'],
      text: Mock.Random.cparagraph(2, 10),
      'time|1577836800000-1640995200000': 1,
      'to|1': ['cjhz1', 'wangsitu1', 'cs1', 'cs2', 'cs3', 'cs4'],
      type: 'text',
      'userUpdateTime|1600000000000-1700000000000': 1,
    }
    // this.ignoreChars = window.nim.ignoreChars
    // this.searchDB = window.nim.searchDB
    this.request = window.indexedDB.open('nim-cs6')
    this.request.onerror = (event) => {
      console.log(TAG_NAME, '数据库打开报错', event)
    }

    this.request.onsuccess = (event) => {
      this.db = this.request.result
      console.log(
        TAG_NAME,
        '数据库打开成功，拥有三个方法：writeData、readByKeyword、readByPrimary、printUseSize'
      )
    }

    this.request.onupgradeneeded = (event) => {
      this.db = event.target.result
      let objectStore
      console.log(TAG_NAME, 'onupgradeneeded：', db.objectStoreNames)
      if (!db.objectStoreNames.contains('msg1')) {
        objectStore = db.createObjectStore(
          'msg1',
          // { keyPath: 'id', autoIncrement: true }
          { keyPath: 'idClient' }
        )
        objectStore.createIndex('idx_idClient', 'idClient', { unique: true })
        // objectStore.createIndex('idx_fulltext', 'terms', { multiEntry: true });
      }
    }
  }

  /**
   * 根据消息id获取
   * @param {String} id
   */
  readByPrimary(id) {
    const transaction = this.db.transaction(['msg1'])
    const objectStore = transaction.objectStore('msg1')
    const request = objectStore.get(id)

    console.time(TAG_NAME, 'readByPrimary last')
    request.onerror = function (event) {
      console.log(TAG_NAME, '事务失败')
    }

    request.onsuccess = function (event) {
      console.timeEnd(TAG_NAME, 'readByPrimary last')
      if (request.result) {
        console.log(TAG_NAME, 'GET: ', request.result)
      } else {
        console.log(TAG_NAME, '未获得数据记录')
      }
    }
  }

  /**
   * 根据关键字获取
   * @param {String} text
   * @param {Number} limit
   */
  async readByKeyword(text, limit) {
    console.time(TAG_NAME, 'readByKeyword last')

    // searchDB.INDEX.STORE.clear()  清除所有
    // const searchParams = window.nim._cut(text)
    const result = await this.searchDB
      .QUERY({
        text: text
      })

    console.log(result, TAG_NAME)
    console.timeEnd(TAG_NAME, 'readByKeyword last')
  }

  /**
   * 写数据
   * @param {Number} num
   * @param {String} text
   */
  async writeData(num = 100, text = '') {
    const transaction = this.db.transaction(['msg1'], 'readwrite')
    const objectStore = transaction.objectStore('msg1')

    console.log(TAG_NAME, '写事务开始：')

    let tempTime = new Date().getTime()

    let fts = []

    for (let i = 0; i < num; i++) {
      let temp = Mock.mock(this.obj)
      let txt = Mock.Random.cparagraph(2, 10)
      // temp.idClient = 'Tua4jkM5cdg3Knkd7Qi1TqGDuiuZfGWh'
      fts.push({
        ...temp,
        text: txt,
      })
      objectStore.add({
        ...temp,
        text: txt,
        // terms: FullText.tokenize(temp.text, 'ch').filter(word => !this.ignoreChars.includes(word))
        // terms: window.nim._cut(temp.text).filter(word => !this.ignoreChars.includes(word))
      })
    }

    console.time('插入FTS')
    await window.nim.putFts(fts);
    console.timeEnd('插入FTS')

    // this.searchDB.PUT(fts).then(() => {
    //   console.log(
    //     TAG_NAME,
    //     'search-index save success, last: ',
    //     new Date().getTime() - tempTime
    //   )
    // })

    // do add 100 times
    transaction.oncomplete = function (event) {
      console.log(
        TAG_NAME,
        'transaction success, writeData last: ',
        new Date().getTime() - tempTime
      )
    }

    transaction.onerror = function (event) {
      console.log(TAG_NAME, 'transaction error: ' + transaction.error)
    }
  }

  /**
   * 写数据
   * @param {Number} num
   */
   async writeDataInIndexDB(num = 50000) {
    const transaction = this.db.transaction(['msg1'], 'readwrite')
    const objectStore = transaction.objectStore('msg1')

    console.log(TAG_NAME, '写事务开始：')

    let tempTime = new Date().getTime()


    for (let i = 0; i < num; i++) {
      let temp = Mock.mock(this.obj)
      let txt = Mock.Random.cparagraph(2, 10)
      objectStore.add({
        ...temp,
        text: txt,
      })
    }

    transaction.oncomplete = function (event) {
      console.log(
        TAG_NAME,
        'transaction success, writeDataInIndexDB last: ',
        new Date().getTime() - tempTime,
        ' ms'
      )
    }

    transaction.onerror = function (event) {
      console.log(TAG_NAME, 'transaction error: ' + transaction.error)
    }
  }

  /**
   * 打印占用磁盘大小
   */
  async printUseSize() {
    const obj = await navigator.storage.estimate()
    const size = (obj.usageDetails.indexedDB / 1024 / 1024).toFixed(2)
    console.log(TAG_NAME, `${size} MB`)
  }
}

module.exports = Test
