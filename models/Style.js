module.exports = (sequelize, DataTypes) => {
    const KieuDang = sequelize.define("KieuDang", {
        ten: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    KieuDang.associate = (models) => {
        KieuDang.hasMany(models.SanPham, {
            onDelete: "cascade"
        });
    }

    return KieuDang;
}