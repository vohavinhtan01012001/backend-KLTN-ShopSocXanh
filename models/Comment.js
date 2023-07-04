module.exports = (sequelize, DataTypes) => {
    const BinhLuan = sequelize.define("BinhLuan", {
        noiDung: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    BinhLuan.associate = (models) => {
        BinhLuan.belongsTo(models.NguoiDung)
        BinhLuan.belongsTo(models.SanPham);
        BinhLuan.hasMany(models.BinhLuan2);
    }

    return BinhLuan;
}