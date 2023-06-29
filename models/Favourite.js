module.exports = (sequelize, DataTypes) => {
    const YeuThich = sequelize.define("YeuThich");

    YeuThich.associate = (models) => {
        YeuThich.belongsTo(models.NguoiDung);
        YeuThich.belongsTo(models.SanPham);
    }
    

    return YeuThich;
}