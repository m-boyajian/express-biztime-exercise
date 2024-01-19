const request = require("supertest");

const app = require("../app");
const { testData } = require("../_testSetup");
const db = require("../db");

beforeEach(testData);

afterAll(async () => {
  await db.end()
})

/** GET /invoices - returns `{invoices: [invoice, ...]}` */
describe("GET /", function() {
  test("Gets a list of 1 invoice", async function() {
    const response = await request(app).get(`/invoices`);
    expect(response.body).toEqual({
      "invoices": [
        { comp_code: "apple", id: 1 },
        { comp_code: "apple", id: 2 },
        { comp_code: "apple", id: 3 },
        { comp_code: "ibm", id: 4 },
      ]
    })
  });  
});

/** GET /invoices/[id] - return data about one invoice: `{invoice: invoice}`*/
describe("GET /1", function() {
  test("Gets a single invoice", async function() {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual({
      "invoice": {
        id: 1,
        amt: 100,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
        company: {
          code: 'apple',
          name: 'Apple',
          description: 'Maker of OSX.',
        }
        }
      }
    );
  });

  test("Responds with 404 if can't find invoice", async function() {
    const response = await request(app).get(`/invoices/999`);
    expect(response.statusCode).toEqual(404);
  })
});

/** POST /invoices - create invoice from data; return `{invoice: invoice}` */

describe("POST /", function() {
  test("Creates a new invoice", async function() {
    const response = await request(app)
      .post(`/invoices`)
      .send({comp_code: "ibm", amt: 100.00});

    expect(response.body).toEqual({
          "invoice": {
            id: 4,
            comp_code: "ibm",
            amt: 100,
            add_date: expect.any(String),
            paid: false,
            paid_date: null,
          }
      }
    );
  });
});

/** PUT /invoices/[id] - update invoice; return `{invoice: invoice}` */
describe("PUT /", function () {
  test("Updates a single invoice", async function () {
    const response = await request(app)
      .put("/invoices/1")
      .send({amt: 150.00, paid: false});

    expect(response.body).toEqual(
      {
        "invoice": {
          id: 1,
          comp_code: 'apple',
          paid: false,
          amt: 1000,
          add_date: expect.any(String),
          paid_date: null,
        }
      }
    );
  });

  test("Responds with 404 if can't find invoice", async function () {
    const response = await request(app)
      .put(`/invoices/9999`)
      .send({amt: 150.00});

    expect(response.statusCode).toEqual(404);
  });

  test("Responds with 500 if data is missing.", async function (){
    const response = await request(app)
      .put("/invoices/1")
      .send({});

    expect(response.status).toEqual(500);
  })
});

/** DELETE /invoices/[id] - delete invoice,
 *  return `{message: "Invoice deleted"}` */

describe("DELETE /invoices/:id", function() {
  test("Deletes a single a invoice", async function() {
    const response = await request(app)
      .delete(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "Invoice deleted" });
  });
});