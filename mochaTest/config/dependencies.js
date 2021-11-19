// General

const path = require('path');
const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const nodeoutlook = require('nodejs-nodemailer-outlook')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

// Base de Datos

const crypto = require('crypto');
const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');

module.exports = {
    path, express, passport,
    flash, nodemailer, Handlebars,
    bodyParser,session, exphbs, schedule,
    methodOverride, crypto, nodeoutlook,
    multer, mongoose, GridFsStorage,
    Grid, allowInsecurePrototypeAccess
}