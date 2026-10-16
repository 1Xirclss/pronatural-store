import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import usersModel from '../src/models/Usuarios.js';
import empleadosModel from '../src/models/Empleados.js';
import clientesModel from '../src/models/Clientes.js';
import authController from '../src/controllers/authController.js';

test('el acceso de clientes usa su cuenta aunque exista un administrador con el mismo correo', async () => {
  const password = 'ClaveCliente123';
  const customer = {
    _id: 'customer-id',
    email: 'cliente@example.com',
    name: 'Cliente',
    password: await bcrypt.hash(password, 4),
    save: async () => {},
  };
  const originals = [usersModel.findOne, empleadosModel.findOne, clientesModel.findOne];
  usersModel.findOne = async () => ({ contraseña: await bcrypt.hash('OtraClave123', 4), save: async () => {} });
  empleadosModel.findOne = async () => null;
  clientesModel.findOne = async () => customer;
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    cookie() { return this; },
    json(body) { this.body = body; return this; },
  };
  try {
    await authController.login({ body: { email: customer.email, password, role: 'Customer' } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.user.role, 'Customer');
  } finally {
    [usersModel.findOne, empleadosModel.findOne, clientesModel.findOne] = originals;
  }
});

test('el acceso de clientes rechaza credenciales válidas de administrador sin crear sesión', async () => {
  const password = 'ClaveAdmin123';
  const admin = {
    _id: 'admin-id',
    correo: 'admin@example.com',
    contraseña: await bcrypt.hash(password, 4),
    save: async () => {},
  };
  const originals = [usersModel.findOne, empleadosModel.findOne, clientesModel.findOne];
  usersModel.findOne = async () => admin;
  empleadosModel.findOne = async () => null;
  clientesModel.findOne = async () => null;
  const response = {
    statusCode: 200,
    cookies: [],
    status(code) { this.statusCode = code; return this; },
    cookie(...args) { this.cookies.push(args); return this; },
    json(body) { this.body = body; return this; },
  };
  try {
    await authController.login({ body: { email: admin.correo, password, role: 'Customer' } }, response);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.token, undefined);
    assert.equal(response.body.user, undefined);
    assert.equal(response.cookies.length, 0);

    // El mismo administrador conserva el acceso desde su propio formulario.
    await authController.login({ body: { email: admin.correo, password } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.user.role, 'Admin');
    assert.ok(response.body.token);
  } finally {
    [usersModel.findOne, empleadosModel.findOne, clientesModel.findOne] = originals;
  }
});
