
module.exports = (sequelize, DataTypes) => {
    const KhuyenMai = sequelize.define("KhuyenMai", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        tieuDe: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        giamGia: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });
    KhuyenMai.associate = (models) => {
        KhuyenMai.hasMany(models.SanPham, {
            onDelete: "cascade"
        });
    }
    return KhuyenMai;
}