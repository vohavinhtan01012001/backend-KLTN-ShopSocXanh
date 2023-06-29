module.exports = (sequelize, DataTypes) => {
    const GioHang = sequelize.define("GioHang", {
        kichThuoc: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        soLuongSP: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    });
    GioHang.associate = function (models) {
        GioHang.belongsTo(models.NguoiDung);
        GioHang.belongsTo(models.SanPham);
    };

    return GioHang;
}