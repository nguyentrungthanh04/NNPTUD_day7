var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

function parseQuantity(value) {
    return Number(value);
}

router.get('/', async function (req, res) {
    let inventories = await inventoryModel.find({}).populate({
        path: 'product'
    });
    res.send(inventories);
});

router.get('/:id', async function (req, res) {
    try {
        let inventory = await inventoryModel.findById(req.params.id).populate({
            path: 'product'
        });
        if (!inventory) {
            return res.status(404).send({ message: 'ID NOT FOUND' });
        }
        res.send(inventory);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.post('/add-stock', async function (req, res) {
    try {
        let quantity = parseQuantity(req.body.quantity);
        if (!req.body.product || Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }

        let inventory = await inventoryModel.findOneAndUpdate(
            { product: req.body.product },
            { $inc: { stock: quantity } },
            { new: true }
        ).populate('product');

        if (!inventory) {
            return res.status(404).send({ message: 'INVENTORY NOT FOUND' });
        }

        res.send(inventory);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.post('/remove-stock', async function (req, res) {
    try {
        let quantity = parseQuantity(req.body.quantity);
        if (!req.body.product || Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }

        let inventory = await inventoryModel.findOneAndUpdate(
            {
                product: req.body.product,
                stock: { $gte: quantity }
            },
            { $inc: { stock: -quantity } },
            { new: true }
        ).populate('product');

        if (!inventory) {
            return res.status(400).send({ message: 'INVENTORY NOT FOUND OR STOCK NOT ENOUGH' });
        }

        res.send(inventory);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.post('/reservation', async function (req, res) {
    try {
        let quantity = parseQuantity(req.body.quantity);
        if (!req.body.product || Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }

        let inventory = await inventoryModel.findOneAndUpdate(
            {
                product: req.body.product,
                stock: { $gte: quantity }
            },
            { $inc: { stock: -quantity, reserved: quantity } },
            { new: true }
        ).populate('product');

        if (!inventory) {
            return res.status(400).send({ message: 'INVENTORY NOT FOUND OR STOCK NOT ENOUGH' });
        }

        res.send(inventory);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.post('/sold', async function (req, res) {
    try {
        let quantity = parseQuantity(req.body.quantity);
        if (!req.body.product || Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ message: 'product and quantity (> 0) are required' });
        }

        let inventory = await inventoryModel.findOneAndUpdate(
            {
                product: req.body.product,
                reserved: { $gte: quantity }
            },
            { $inc: { reserved: -quantity, soldCount: quantity } },
            { new: true }
        ).populate('product');

        if (!inventory) {
            return res.status(400).send({ message: 'INVENTORY NOT FOUND OR RESERVED NOT ENOUGH' });
        }

        res.send(inventory);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;