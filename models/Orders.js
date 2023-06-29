module.exports = (sequelize, DataTypes) => {
    const DonHang = sequelize.define("DonHang", {
        hoTen: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sdt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        diaChi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ghiChu: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        tongTien: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
        trangThai: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        thanhToanTienMat: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        thanhToanVnpay: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        giaoHang: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });

    DonHang.associate = (models) => {
        DonHang.hasMany(models.ChiTietDonHang);
        DonHang.belongsTo(models.NguoiDung);
    }
    return DonHang;
}