
// const { validationResult } = require("express-validator");

// module.exports = (req,res,view,data) => { 
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         console.log(errors.array());
//         res.locals.errorValidations = errors.array();
//         return res.status(422).render(view,{
//             path:data.path,
//             pageTitle:data.pageTitle,
//             oldInput:data.oldInput,
//         });
//     } 
// }