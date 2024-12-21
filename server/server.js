const express = require('express');
const mongoose = require ('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require ('crypto');
const { timeStamp } = require('console');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin : 'http://localhost:5173/',
    methods : ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders : [
       'Content-Type',
        'Authorization',
        'Cache-Control',
        'Expires',
        'Pragma'
    ],
    credentials : true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extend:true}));

app.listen(PORT, ()=> console.log(`server is connected ${PORT}`))
mongoose.connect('mongodb+srv://Kanchisaw:Kanchi03@cluster0.f1fmc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
{
    usenewUrlParser: true,
    useUnifiedTopology : true
})

.then(() => console.log('Mongodb connected'))
.catch(err => console.error(err));


const userSchema = new mongoose.Schema({
    name: {type: String, required : true},
    email: {type: String, required : true, unique : true},
    password:{type: String, required : true},
    upi_id: {type: String, required : true},
    balance : {type: Number}
});

const User = mongoose.model('User' , userSchema);

const  transactionSchema = new mongoose.Schema({
    sender_upi_id:{type: String, required : true},
    receiver_upi_id:{type: String, required : true},
    amount : {type: Number, required : true},
    timeStamp:{type: Date, default : Date.now}
});

const Transaction = mongoose.model('Transaction', transactionSchema);
const generateUPI = () => {
    const randomId = crypto.randomBytes(4).toString('hex');
    return `${randomId}@fastpay`;
};

app.post('/api/signup', async (req, res) => {
    try{
        const{ name, email, password} = req.body;

        let user = await User.findOne({email});
        if (user) {
            return res.status (400).send ({message: 'usre already exist'});

        }

        const upi_id = generateUPI();
        const balance = 200;

        user = new User ({ name, email, password, upi_id, balance});
        await user.save();
        res.status(201).send({ message : 'sucsess' , upi_id});
    }    catch (error){
            console.error(error);
            res.status(500).send({message:'error'});
        }

});
