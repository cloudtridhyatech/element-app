class Contact {
    constructor(firstName, lastName, email, id = null) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.id = id;
    }
}

class InvoiceItem {
    constructor(description, price, net, tva, taxLineType) {
        this.description = description;
        this.price = price;
        this.net = net;
        this.tva = tva;
        this.taxLineType = taxLineType;
    }
}

class Invoice {
    constructor(invoiceDate, dueDate, reference, items, id = null, hasPayments = false, isOnlineBooking = false) {
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.reference = reference;
        this.items = items;
        this.id = id;
        this.hasPayments = hasPayments;
        this.isOnlineBooking = isOnlineBooking;
    }
}

class InvoiceSystemError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvoiceSystemError";
    }
}

const TaxLineType = Object.freeze({ "none": 0, "primary": 1, "secondary": 2 })

module.exports = {
    Contact: Contact,
    InvoiceItem: InvoiceItem,
    Invoice: Invoice,
    InvoiceSystemError: InvoiceSystemError,
    TaxLineType: TaxLineType
}