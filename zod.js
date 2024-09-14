const zod = require("zod");
const jwt = require("jsonwebtoken");

const email = zod.string().regex(/^[a-zA-Z0-9._%+-]+@lnmiit\.ac\.in$/);

const password = zod.string().min(8).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);


function signjwt(eml , pass){
    const status1 = email.safeParse(eml);
    const status2 = password.safeParse(pass);

    if(!status1.success || !status2.success){
        return false;
    }
    const token = jwt.sign(
        {   
            email: eml,
            password: pass
        },"secret");
    return token;
}

module.exports = signjwt;