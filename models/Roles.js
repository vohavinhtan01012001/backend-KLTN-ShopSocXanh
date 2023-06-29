module.exports = (sequelize, DataTypes) => {
    const VaiTro = sequelize.define("VaiTro", {
        tenVaiTro: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });
    VaiTro.associate = (models) => {
        VaiTro.hasMany(models.VaiTroPhanQuyen, {
            onDelete: "cascade"
        });
        VaiTro.hasMany(models.NguoiDung);
    }

    return VaiTro;
}