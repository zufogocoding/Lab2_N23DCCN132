const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// calculatedTotal for items
function calculateTotal(items) {
    return items.reduce((sum, item) => {
        return sum + item.quantity * item.unitPrice;
    }, 0);
}

// 1. Lay toan bo don hang (GET /api/orders)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            message: 'Lay danh sach don hang thanh cong',
            data: orders
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { status, sort } = req.query;

        let filter = {};
        let sortOption = { createdAt: -1 }; // default

        // 🔎 Filter theo status
        if (status) {
            filter.status = status;
        }

        // 🔽 Sort theo totalAmount
        if (sort) {
            sortOption = {
                totalAmount: sort === 'asc' ? 1 : -1
            };
        }

        const orders = await Order.find(filter).sort(sortOption);

        res.json({
            success: true,
            message: 'Lay danh sach don hang thanh cong',
            data: orders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Vui long nhap ten can tim',
                data: null
            });
        }

        const orders = await Order.find({
            customerName: {
                $regex: name,
                $options: 'i'
            }
        });

        res.json({
            success: true,
            message: 'Tim kiem thanh cong',
            data: orders
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});


// 2. Lay don hang theo ID (GET /api/orders/:id)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay don hang',
                data: null
            });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// 3. Tao don hang moi (POST /api/orders)
router.post('/', async (req, res) => {

    const { customerName, customerEmail, items, totalAmount } = req.body;

    const calculatedTotal = calculateTotal(items);

    if (calculateTotal != totalAmount) {
        return res.status(400).json({
            success: false,
            message: 'totalAmount khong hop le',
            data: null
        });
    }

    const order = new Order({
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        items: req.body.items,
        totalAmount: req.body.totalAmount
    });

    try {
        const newOrder = await order.save();
        res.status(201).json({
            success: true,
            message: 'Tao don hang thanh cong',
            data: newOrder
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            data: null
        });
    }

});
// 4. Cap nhat trang thai don hang (PUT /api/orders/:id)
router.put('/:id', async (req, res) => {
    try {
        if (req.body.items && req.body.totalAmount) {
            const calculatedTotal = calculateTotal(req.body.items);

            if (calculatedTotal !== req.body.totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: 'totalAmount khong hop le',
                    data: null
                });
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Khong tim thay don hang',
                data: null
            });
        }

        res.json({
            success: true,
            message: 'Cap nhat thanh cong',
            data: updatedOrder
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});
// 5. Xoa don hang (DELETE /api/orders/:id)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Khong tim thay don hang', data: null });
        res.json({
            success: true,
            message: 'Da xoa don hang thanh cong!',
            data: null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;

