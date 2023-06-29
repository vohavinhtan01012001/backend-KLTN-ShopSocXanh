module.exports = (sequelize, DataTypes) => {
    const BinhLuan2 = sequelize.define("BinhLuan2", {
        noiDung: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    BinhLuan2.associate = (models) => {
        BinhLuan2.belongsTo(models.NguoiDung);
        BinhLuan2.belongsTo(models.BinhLuan);
        BinhLuan2.belongsTo(models.SanPham);
    }

    return BinhLuan2;
}