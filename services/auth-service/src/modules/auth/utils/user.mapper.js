"use strict";

function buildCustomerUserInfo(user, customerType) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    customerType,
  };
}

function buildSellerUserInfo(seller) {
  return {
    id: seller._id,
    name: seller.name,
    email: seller.email,
    role: seller.role,
    status: seller.status,
    profileImage: seller.profileImage,
  };
}

function buildAdminUserInfo(admin) {
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    profileImage: admin.profileImage,
  };
}

module.exports = {
  buildCustomerUserInfo,
  buildSellerUserInfo,
  buildAdminUserInfo,
};
