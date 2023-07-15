const express = require('express')
const router = express.Router()
const { VaiTro, NguoiDung, PhanQuyen, VaiTroPhanQuyen } = require('../../models');
const { adminAuth } = require('../../middlewares/AuthAdmin');

//show all role and permissions
router.get('/show-all', adminAuth, async (req, res) => {
    const role = await VaiTro.findAll();
    const permissions = await PhanQuyen.findAll();
    const rolePermission = await VaiTroPhanQuyen.findAll();
    try {
        res.status(200).json({ role: role, permissions: permissions, rolePermission: rolePermission })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/show-role/:id', adminAuth, async (req, res) => {
    const id = req.params.id;
    const role = await VaiTro.findOne({ where: { id: id } });
    const rolePermission = await VaiTroPhanQuyen.findAll({ where: { VaiTroId: id } });
    const permissions = await PhanQuyen.findAll();
    const IdPermission = []
    rolePermission.map((item) => {
        IdPermission.push(item.PhanQuyenId)
    })
    const listPermission = []
    permissions.map((permission) => {
        for (let i = 0; i < IdPermission.length; i++) {
            if (permission.id === IdPermission[i]){
                listPermission.push(permission.tenQuanLi)
            }
        }
    })

    try {
        res.status(200).json({ role: role, listPermission: listPermission })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})



//show all RolePermission theo id role
router.get('/show-permission/:id', adminAuth, async (req, res) => {
    const id = req.params.id;
    const rolePermissions = await VaiTroPhanQuyen.findAll({ where: { VaiTroId: id } })
    console.log(rolePermissions)
    try {
        res.status(200).json({ rolePermissions: rolePermissions })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//Phân trang Roles
router.get("/role", adminAuth, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    try {
        const roles = await VaiTro.findAndCountAll({
            offset,
            limit,
        });

        const totalPages = Math.ceil(roles.count / limit);
        res.json({
            status: 200,
            totalPages,
            roles: roles.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//update user
router.put("/upload-user", adminAuth, async (req, res) => {
    const { id, VaiTroId } = req.body;
    await NguoiDung.update({ VaiTroId: VaiTroId }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})


//update role
router.put("/upload-role", adminAuth, async (req, res) => {
    const { id, tenVaiTro, moTa } = req.body;
    await VaiTro.update({ tenVaiTro: tenVaiTro, moTa: moTa }, { where: { id: id } })
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//update RolePermissions
router.put("/upload-RolePermissions/:id", adminAuth, async (req, res) => {
    const { permissions } = req.body;
    const VaiTroId = req.params.id;
    const role = await VaiTroPhanQuyen.findOne({ where: { VaiTroId: VaiTroId } })
    if (role) {
        await VaiTroPhanQuyen.destroy({ where: { VaiTroId: VaiTroId } })
    }
    console.log(permissions)
    console.log(VaiTroId)
    try {
        for (let i = 0; i < permissions.length; i++) {
            if (permissions[i] != 0) {
                await VaiTroPhanQuyen.create({ PhanQuyenId: permissions[i], VaiTroId: VaiTroId });
            }
        }
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

//Tìm permission theo role
router.get('/permission/:id', adminAuth, async (req, res) => {
    const id = req.params.id;
    const RolePermissions = await VaiTroPhanQuyen.findAll({ where: { VaiTroId: id } });
    try {
        res.status(200).json({ RolePermissions: RolePermissions })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Add role
router.post("/add-role", adminAuth, async (req, res) => {
    const { tenVaiTro, moTa } = req.body;
    await VaiTro.create({ tenVaiTro: tenVaiTro, moTa: moTa });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})


//update role
router.put("/upload-role", adminAuth, async (req, res) => {
    const { id, tenVaiTro, moTa } = req.body;
    await VaiTro.update({ tenVaiTro: tenVaiTro, moTa: moTa }, { where: { id: id } });
    try {
        res.status(200).json({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
})

module.exports = router;
