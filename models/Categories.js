module.exports = (sequelize, DataTypes) => {
    const TheLoai = sequelize.define("TheLoai", {
        ten: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    TheLoai.associate = (models) => {
        TheLoai.hasMany(models.SanPham, {
            onDelete: "cascade"
        });
    }

    return TheLoai;
}