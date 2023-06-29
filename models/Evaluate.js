module.exports = (sequelize, DataTypes) => {
    const DanhGia = sequelize.define("DanhGia",{
        danhGia: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });

    DanhGia.associate = (models) => {
        DanhGia.belongsTo(models.NguoiDung);
        DanhGia.belongsTo(models.SanPham);
    }


    return DanhGia;
}