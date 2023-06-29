module.exports = (sequelize, DataTypes) => {
    const MauSac = sequelize.define("MauSac", {
        tenMau: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    MauSac.associate = (models) => {
        MauSac.hasMany(models.SanPham, {
            onDelete: "cascade"
        });
    }

    return MauSac;
}