import express from 'express'
import {createTransport} from'nodemailer'

const router = express.Router()
const transporter = createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'sally17@ethereal.email',
        pass: 'EBkqq5TqmCFUyr4GZT'
    }
});
router.post('/sendMail', (req,res)=>{
    const {subject, message} = req.body
    const mailOptions = {
        from:'admin@epicodetest.it',
        to: 'ciao@gmail.com',
        subject,
        message
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.error('Email non inviata')
            res.status(500).send('Email non inviata')
        }
        res.status(200).send('Email inviata correttamente')
    })
})

export default router