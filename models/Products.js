
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
        mauSac: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        moTa: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        trangThai: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    });

    SanPham.associate = function (models) {
        SanPham.belongsTo(models.TheLoai);
        SanPham.belongsTo(models.ThuongHieu);
        SanPham.belongsTo(models.KhuyenMai);
      };
    return SanPham;
}