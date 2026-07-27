const authService = require("../services/auth.service.js");
const CustomError = require("../utils/CustomError.js");
const reusable = require("../utils/reusable.js");
const sessionService = require("../services/session.service.js");


const setTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "PROD",
        sameSite: process.env.NODE_ENV === "PROD" ? "strict" : "lax",
        maxAge: parseInt(process.env.SESSION_EXPIRES_IN) * 1000,
        path: "/"
    });
};

const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const response = await authService.login(email, password);

        setTokenCookie(res, response.refreshToken);

        return res.status(200).json({
            message: "Logged In Successfully",
            success: true,
            accessToken: response.accessToken
        });
    } catch (error) {
        next(error);
    }
};

const registerController = async (req, res, next) => {
    try {
        const { email, password, ...reqData } = req.body;
        const response = await authService.register(email, password, reqData);

        return res.status(200).json({
            success: true,
            message: `Verify Account using OTP send to ${email}`
        });
    } catch (error) {
        next(error);
    }
};

const registerVerifyController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const response = await authService.registerVerify(email, otp);

        setTokenCookie(res, response.refreshToken);

        return res.status(201).json({
            success: true,
            message: "Account Verification Successfull",
            accessToken: response.accessToken,
            user: response.user
        });
    } catch (error) {
        next(error);
    }
};

const logoutController = async (req, res, next) => {
    try {

        const refreshToken = req.cookie?.refreshToken;

        if (refreshToken) {
            const { decoded, success } = reusable.verifyToken(refreshToken, "refresh");
            if (success) {
                await sessionService.revokeSession(decoded._id);
            }
        }

        res.clearCookie("refreshToken", { path: "/" });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

const refreshAccessTokenController = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throw new CustomError(400, "Forbidden");
        }

        const response = await authService.refreshAccessToken(refreshToken);
        setTokenCookie(res, response.newToken);

        return res.status(200).json({
            success: true,
            accessToken: response.accessToken,
            message: "Access Token Refreshed Successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginController, registerController, registerVerifyController, logoutController, refreshAccessTokenController
};