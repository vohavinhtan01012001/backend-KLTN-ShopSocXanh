
module.exports = (sequelize, DataTypes) => {
    const SanPham = sequelize.define("SanPham", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        ten: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        giaTien: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        giaGiam: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        hinh: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hinh2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hinh3: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hinh4: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        soLuongM: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        soLuongL: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        soLuongXL: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        moTa: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        trangThai: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });

    SanPham.associate = function (models) {
        SanPham.belongsTo(models.TheLoai);
        SanPham.belongsTo(models.ThuongHieu);
        SanPham.belongsTo(models.KhuyenMai);
        SanPham.belongsTo(models.MauSac);
        SanPham.belongsTo(models.ChatLieu);
        SanPham.hasMany(models.GioHang);
        SanPham.hasMany(models.ChiTietDonHang);
        SanPham.hasMany(models.YeuThich);
        SanPham.hasMany(models.BinhLuan);
        SanPham.hasMany(models.BinhLuan2);
      };
    return SanPham;
}