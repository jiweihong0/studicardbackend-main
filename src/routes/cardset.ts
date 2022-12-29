import { Router as expressRouter ,Express} from "express";
import Cardset from "../models/cardset";
import verify_token from "../middleware/verify_token";
import Question from "../models/question";
import { Op ,Sequelize} from "sequelize";
import Account from "../models/account";
import { group } from "console";
import sequelize from "../init/database";


export default (ctx: { [key: string]: any }, app: Express) => {
    const router= expressRouter();
    const database = ctx.sequelize;

    // 取得所有卡片集
    router.get("/getall", verify_token(),async (req, res) => {
        try {
            await database.sync()
            const cardset = await Cardset.findAll()
            return res.status(200).json(cardset)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )

    //取得所有跟使用者有關的卡片
    router.get("/getallbyaccount",verify_token(), async (req,res)=>
    {
        try {
            await database.sync()
            const cardset = await Cardset.findAll({
                where: {
                    create_by: res.locals.decoded.account_id,
                },
            })
            console.log(cardset)
            const cardsetdata = cardset[0]==null?"no data":cardset
            return res.status(200).json({cardset:cardsetdata})
            
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
            
        }
    }
    )
    

    // 點擊新增卡片集
    router.post("/add",verify_token(),async (req, res) => {
        const cardset_title = req.body.cardset_title
        try {
            await database.sync()
            const cardset = await Cardset.create({
                cardset_title: cardset_title,
                is_available: true,
                create_by: res.locals.decoded.account_id
            })
            return res.status(200).json(cardset)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )

    // 點擊刪除卡片集
    router.post("/delete" ,verify_token(), async (req, res) => {
        const cardset_id = req.body.cardset_id
        try {
            await database.sync()

            const create_obj = await Cardset.findOne({
                attributes: ['create_by'],
                where: {
                    cardset_id: cardset_id,
                }
            })

            const create_by = create_obj?.create_by ?? null

            if (res.locals.decoded.account_id !== create_by) {
                return res.status(500).json({ message: "You are not the owner of this cardset or not be created" });
            }
            
            await Cardset.destroy({
                where: {
                    cardset_id: cardset_id 
                }
            })

            await Question.destroy({
                where: {
                    cardset_id: cardset_id
                }
            })

            return res.status(200).json({message:"delete complete"})
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )

    // 點擊修改卡片集
    router.post("/update",verify_token(), async (req, res) => {
        const cardset_id = req.body.cardset_id
        const cardset_title = req.body.cardset_title
        try {
            await database.sync()
            const create_obj = await Cardset.findOne({
                attributes: ['create_by'],
                where: {
                    cardset_id: cardset_id,
                }
            })
            
            if (res.locals.decoded.account_id !== create_obj?.create_by) {
                return res.status(500).json({ message: "You are not the owner of this cardset or not be created" });
            }
            const cardset = await Cardset.update({
                cardset_title: cardset_title
            }, {
                where: {
                    cardset_id: cardset_id
                }
            })
            return res.status(200).json({message:"update complete"})
            
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )

    // 取得自己卡片集
    router.get("/getcard/:cardset_id", verify_token(), async (req, res) => {
        const cardset_id = req.params.cardset_id
        console.log(cardset_id)
        try {
            await database.sync()
            
            const cardset = await Cardset.findOne({
                attributes: ['create_by',"cardset_title"],
                where: {
                    cardset_id: cardset_id
                }
            })
            
            if (cardset === null) {
                return res.status(500).json({ message: "Cardset not found" });
            }

            const questions = await Question.findAll({
                ['attributes']: [['question_id','id'], ['question_title','question'], 'answer'],
                where: {
                    cardset_id: cardset_id
                },
                raw: true,

            })
            

            const isEditable = cardset?.create_by === res.locals.decoded.account_id

            return res.status(200).json({ id:cardset_id,name:cardset?.cardset_title,questions, isEditable})
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )
    // 
    // 用cardset_title取得卡片集
    router.get("/getcardsetbytitle/:cardset_title", verify_token(), async (req, res) => {
        const cardset_title = req.params.cardset_title
        try {
            await database.sync()
            const cardset = await Cardset.findAll({
                attributes: ['cardset_id', 'cardset_title', 'is_available', 'create_by'],
                where: {
                    cardset_title: cardset_title
                }
            })
            return res.status(200).json(cardset)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )


    //取得前10張卡片
    router.get("/getbypage/:page", verify_token(), async (req, res) => {
        const page = parseInt(req.params.page) 
        try {
            await database.sync()
            const cardset = await Cardset.findAll({
                where: {
                    create_by: res.locals.decoded.account_id,
                },
                limit: 10,
                offset: 10 * (page - 1)
            })
            return res.status(200).json(cardset)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )

    // 取得所有卡片集 透過page,cardset_title
    router.get("/getbysearch/:page/:cardset_title?", verify_token(), async (req, res) => {
        const page = parseInt(req.params.page)
        const cardset_title = req.params.cardset_title ?? ""
        console.log(cardset_title,111111111111111);
        
        try {
            await database.sync()

            const cardset = await Cardset.findAll({
                attributes: [
                    ['cardset_id','id'],
                    ['cardset_title','title'],
                ],
                where: {
                    cardset_title: {
                        [Op.like]: `%${cardset_title}%`
                    }
                },
                limit: 10,
                offset: 10 * (page - 1),
                include: [
                    {
                        model: Account,
                        ['attributes']: [['account_name','createrName']],
                    },
                ],
                raw: true,

            }) as any[]
            
            const cardsetWithCount = await Promise.all(cardset.map((async(item) => {
                const cardsetId = item.id
                const count = await Question.count({
                    where: {
                        cardset_id: cardsetId
                    }
                })
                return {
                    id: item.id,
                    title: item.title,
                    createrName: item['account.createrName'],
                    questionLength: count
                }
            })))

            
            return res.status(200).json(cardsetWithCount)
        } catch (err) {
            if (err instanceof Error) {
                return res.status(500).json({ message: err.message });
            }
            res.status(500).json({ message: "Some Error happend..." });
        }
    }
    )


    app.use("/api/cardset", router);
}
