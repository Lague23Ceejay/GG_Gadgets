import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>res.json({status:'test-server ok'}));

import * as CustomerModel from './models/customers.model.js';

app.get('/api/v1/customers', async (req,res)=>{
  try{
    const data = await CustomerModel.getAllCustomers();
    res.json(data);
  }catch(e){ res.status(500).json({error:e.message||e}); }
});

app.get('/api/v1/customers/:id', async (req,res)=>{
  try{ const data = await CustomerModel.getCustomerById(req.params.id); res.json(data); }catch(e){ res.status(500).json({error:e.message||e}); }
});

app.post('/api/v1/customers', async (req,res)=>{
  try{ const id = await CustomerModel.createCustomer(req.body); res.status(201).json({id}); }catch(e){ res.status(500).json({error:e.message||e}); }
});

const PORT = 3001;
app.listen(PORT, ()=>console.log(`Test server running on port ${PORT}`));
