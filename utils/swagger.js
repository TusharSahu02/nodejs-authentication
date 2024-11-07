import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

export default swaggerUI.setup(swaggerDocument);
