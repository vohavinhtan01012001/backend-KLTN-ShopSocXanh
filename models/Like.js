module.exports = (sequelize, DataTypes) => {
    const Icon = sequelize.define("Icon", {
        icon: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });

    Icon.associate = (models) => {
        Icon.belongsTo(models.BinhLuan);
        Icon.belongsTo(models.NguoiDung);
        Icon.belongsTo(models.SanPham);
    }

    return Icon;
}