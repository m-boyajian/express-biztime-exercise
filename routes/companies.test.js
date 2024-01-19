// Tests for the companies routes
const request = require("supertest");

const app = require("../app");
const { testData } = require("../_testSetup");
const db = require("../db");

beforeEach(testData);

afterAll(async () => {
  await db.end();
});

describe("GET /", function() {
  test("Gets a list of companies", async function() {
    const response = await request(app).get(`/companies`);
    expect(response.body).toEqual({
      "companies": [
        {code: "apple", name: "Apple"},
        {code: "ibm", name: "IBM"},
      ]
    });
  });
});

/** GET /companies/[id] - return data about one company: `{company: company}`*/
describe("GET /apple", function() {
  test("Gets a single company", async function() {
    const response = await request(app).get("companies/apple");
    expect(response.body).toEqual(
      {
        "company": {
          code: "apple",
          name: "Apple",
          description: "Maker of OSX.",
          invoices: [1, 2],
        }
      }
  );
});

  test("Responds with 404 if can't find invoice", async function() {
    const response = await request(app).get(`/companies/bleepbloop`);
    expect(response.statusCode).toEqual(404);
  });
});

/** POST /companies - create company from data; return `{company: company}` */

describe("POST /", function() {
  test("Creates a new company", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        code: "dingaling",
        name: "Dingaling",
        description: "Donut shop"
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      "company": {
        code: "dingaling",
        name: "Dingaling",
        description: "Donut shop"}
    });
  });
});

/** PUT /companies/[id] - update company; return `{company: company}` */
describe("PUT /", function () {
  test("Updates a single company", async function () {
    const response = await request(app)
      .put("/companies/apple")
      .send({description: "TheUltimateComputer", name: "MacBookPro"});

      expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "MacBookPro",
            description: "TheUltimateComputer",
          }
        }
      )
  });      
});

  test("Responds with 404 if can't find company", async function () {
    const response = await request(app)
      .put("/companies/bleepbloop")
      .send({name: "Bleepbloop"});

    expect(response.statusCode).toEqual(404);
  });

/** DELETE /companies/[id] - delete invoice,
 *  return `{message: "Invoice deleted"}` */

describe("DELETE /companies/:code", function() {
  test("Deletes a single a company", async function() {
    const response = await request(app)
      .delete("/companies/apple");
    expect(response.statusCode).toEqual({"status": "deleted"});
  });
});






