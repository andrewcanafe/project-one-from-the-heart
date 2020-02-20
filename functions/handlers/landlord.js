const { admin, db} = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase')

//firebase.initializeApp(config)

exports.verifyWorker = (req,res) => {
  //console.log(ticket_id)
  db
  .doc(`/users/${req.params.worker_email}`)
  .update({verified_worker: true})
  .catch(err => {
    console.error(err)
    return res.status(400).json({error: `Unable to suspend ${req.params.worker_email}`})
  })

  db
  .doc(`/users/${req.params.worker_email}`)
  .get()
  .then( data => {
    let worker = {
      full_name: data.data().full_name,
      address: data.data().address,
      email: data.data().email,
      user_id: data.data().user_id,
      created_at: data.data().created_at,
      verified_worker: true,
    }
    db
    .doc(`/workers/${req.params.worker_email}`)
    .set(worker)
    .then( () => {
      return res.status(200).json({general: `verified ${req.params.worker_email}`})
    })
  })
  .catch(err => {
    console.error(err)
    return res.status(400).json({error: `Unable to verify ${req.params.worker_email}`})
  })

}

exports.verifyTenant = (req,res) => {
  //console.log(ticket_id)
  db
  .doc(`/users/${req.params.tenant_email}`)
  .update({verified_tenant: true})
  .then(() => {
    return res.status(200).json({general: `Verified ${req.params.tenant_email}`})
  })
  .catch(err => {
    console.error(err)
    return res.status(400).json({error: `Unable to verify ${req.params.tenant_email}`})
  })
}

exports.suspendTenant = (req,res) => {
  db
  .doc(`/users/${req.params.tenant_email}`)
  .update({verified_tenant: false})
  .then(() => {
    return res.status(200).json({general: `Suspended ${req.params.tenant_email}`})
  })
  .catch(err => {
    console.error(err)
    return res.status(400).json({error: `Unable to suspend ${req.params.tenant_email}`})
  })
}

exports.suspendWorker = (req,res) => {

  db
  .doc(`/workers/${req.params.worker_email}`)
  .update({verified_worker: false})
  .catch(err => {
    console.error(err)
    return res.status(400).json({error: `Unable to suspend ${req.params.worker_email}`})
  })

  db
  .doc(`/users/${req.params.worker_email}`)
  .update({verified_worker: false})
  .then(() => {
    return res.status(200).json({general: `Suspended ${req.params.worker_email}`})
  })
  .catch(err => {
    console.error(err)
    return res.status(400).json({error: `Unable to suspend ${req.params.worker_email}`})
  })


}
