

import { Router } from "express";
import productsController from "../controllers/ProductosController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = Router();

router.get("/", productsController.getProducts);
router.get("/most-sold", productsController.getMostSoldProduct);
router.get("/:id", productsController.getProduct);
router.post("/", upload.single("img"), productsController.createProduct);
router.put("/:id", upload.single("img"), productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

export default router;
