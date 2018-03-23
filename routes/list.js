const Router = require('koa-router')

const db = require('../database')

const router = new Router()

// 页面
router.get('/', async (ctx) => {
    const phone = ctx.session.phone

    if (phone) {
        await db(`USE user_${phone}`)
        console.log(`database user_${phone} used!`)

        const tableName = ctx.query.tablename
    
        await ctx.render('list', {
            tableName
        })

        console.log('Enter the list Page!')
    } else {
        ctx.response.redirect('/login')
    }
})

// 获取数据表
router.post('gettables', async (ctx) => {
    const phone = ctx.session.phone

    try {
        const tablesRes = await db(`SHOW TABLES;`)

        const tables = tablesRes.map((item) => {
            return item[`Tables_in_user_${phone}`]
        })

        ctx.body = {
            code: 0,
            data: tables
        }
    } catch(err) {
        ctx.body = {
            code: 2,
            msg: err.message
        }
    }
})


// 新增数据表
router.post('insertTable', async (ctx) => {
    const { tableName, attrs } = ctx.request.body

    let attrSql = '( id INT AUTO_INCREMENT PRIMARY KEY,'

    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]

        attrSql += `${ attr.name } 
                    ${ attr.type === 'string' ? 'VARCHAR(255)' : 'INT' } 
                    ${ attr.notNull === 'true' ? 'NOT NULL' : '' }
                    ${ attr.unique === 'true' ? 'UNIQUE' : '' }
                    ${ i === attrs.length - 1 ? ')' : ',' }`
    }

    const sql = `CREATE TABLE ${tableName} ${attrSql} ENGINE=InnoDB DEFAULT CHARSET=utf8;`

    try {
        await db(sql)

        console.log(`created table ${tableName}`)

        ctx.body = {
            code: 0,
            msg: 'success'
        }
    } catch (err) {
        ctx.body = {
            code: 2,
            msg: err.message
        }
    }

    
})


// 删除数据表
router.post('delTable', async (ctx) => {
    const table = ctx.request.body.table

    try {
        await db(`DROP TABLE ${table}`)

        console.log(`drop table ${table} successed`)

        ctx.body = {
            code: 0,
            msg: 'success'
        }
    } catch(err) {
        console.error(err.message)
        ctx.body = {
            code: 2,
            msg: err.message
        }
    }
})

// 判断数据表是否存在
router.get('validateTableName', async (ctx) => {
    const { name } = ctx.query
    try {

        const result = await db(`SHOW TABLES LIKE "${name}"`)

        ctx.body = !(result.length)

    } catch(err) {
        console.error(err.message)
        ctx.body = {
            code: 2,
            msg: err.message
        }
    }
})

module.exports = router