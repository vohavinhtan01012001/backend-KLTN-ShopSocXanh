
module.exports = (sequelize, DataTypes) => {
    const ThuongHieu = sequelize.define("ThuongHieu", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        ten: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });
    ThuongHieu.associate = (models) => {
        ThuongHieu.hasMany(models.SanPham, {
            onDelete: "cascade"
        });
    }
    return ThuongHieu;
}