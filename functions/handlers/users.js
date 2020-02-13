const {db} = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase')

firebase.initializeApp(config)

const {validateSignupData, validateLoginData} = require('../util/validators');

exports.signup = (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password,
    };
  
    const{ valid, errors } = validateSignupData(newUser);

    if(!valid) return res.status(400).json(errors);

    let token, userId;
    db.doc(`/users/${newUser.email}`)
    .get()
    .then((doc) => {
        if (doc.exists){
            return res.status(400).json({handle: 'this email is already taken'});
        }else{
         return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
    })
    //because we have an then, so just use this to do a return
    .then((data) => {
        userId = data.user.uid
        return data.user.getIdToken();
    })
    .then((idToken) => {
        token = idToken;
        const userCredentials = {
          email: newUser.email,
          created_at: new Date().toISOString(),
          userId: userId
        }
        //maybe unsafe to use string eval here
        return db.doc(`/users/${newUser.email}`).set(userCredentials);

    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err)=>{
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          return res.status(400).json({ email: 'email is already in use'})
        }
        return res.status(500).json({error: err.code});
    });
}

exports.login = (req, res) => {
    const user = {
      email: req.body.email,
      password: req.body.password
    };

const{ valid, errors } = validateLoginData(user);

if(!valid) return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(user.email,user.password)
  .then(data=>{
    return data.user.getIdToken();
  })
  .then(token=>{
    return res.json({token});
  })
  .catch(err=>{
    console.error(err);
    if(err.code === 'auth/wrong-password'){
      return res.status(403).json({general: 'Wrong credentials, please try again'});
    } else return res.status(500).json({error:err.code});
  });
  }