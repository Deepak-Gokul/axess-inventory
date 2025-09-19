import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet,Image } from "@react-pdf/renderer";
import Axess from '../assets/AxessLogo.png'
import Seal from '../assets/Axess_Seal.png'
// PDF styles
const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, fontFamily: "Helvetica" },
  header: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 8, letterSpacing: 1},  
  section: { marginBottom: 12 },
  infoRow: { flexDirection: "row", marginBottom: 2 },
  infoCell: { flex: 1, fontSize: 11 },
  boxSection: { borderWidth: 1, borderColor: "#444", padding: 6, marginBottom: 8, minHeight: 50 },
  label: { fontWeight: "bold" },
  table: { display: "table", width: "100%", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, marginTop: 8 },
  row: { flexDirection: "row" },
  cell: { borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#333", padding: 3, fontSize: 10, textAlign: "center" },
  cellHeader: { fontWeight: "bold", backgroundColor: "#efefef" },
  cellDesc: { textAlign: "left", fontSize: 10, padding: 3 },
  summaryRow: { flexDirection: "row", marginTop: 8 },
  summaryLabel: { flex: 2, fontWeight: "bold", fontSize: 11, textAlign: "right", paddingRight: 10 },
  summaryValue: { flex: 1, fontSize: 11, textAlign: "left" },
  signatureSection: { flexDirection: "row", justifyContent: "space-between" },
  signatureBox: { width: "40%", alignItems: "center", paddingTop: 2 },
  companyDetails: { marginTop: 4, fontSize: 10, textAlign: "left" }
});

// PDF Document
const CiplPDF = ({ items, sender, receiver, projectName, poNumber, date, quoteNo }) => {
  // Calculate summary fields
  const totalPackages = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
  const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
  // Date
  const today = new Date();
  const dateString = date ? new Date(date).toLocaleDateString() : today.toLocaleDateString();
  // Placeholders for Quote NO.
  const quoteNumber = quoteNo || "_________";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Image source={Axess} style={{ width: 150, height: 75, marginBottom: 8 }} />
        <Text style={styles.header}>COMMERCIAL INVOICE PACKING LIST</Text>
        {/* Info Row: WO NO., Date, Quote NO., P.O NO. */}
        <View style={styles.infoRow}>
          <Text style={styles.infoCell}><Text style={styles.label}>WO NO.:</Text> {projectName || "_________"}</Text>
          <Text style={styles.infoCell}><Text style={styles.label}>Date:</Text> {dateString}</Text>
          <Text style={styles.infoCell}><Text style={styles.label}>Quote NO.:</Text> {quoteNumber}</Text>
          <Text style={styles.infoCell}><Text style={styles.label}>P.O NO.:</Text> {poNumber || "_________"}</Text>
        </View>

        {/* Sender / Receiver sections */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={[styles.boxSection, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>Shipper / Sender</Text>
              <Text>{sender || "_________________________"}</Text>
            </View>
            <View style={[styles.boxSection, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.label}>Consignee / Receiver</Text>
              <Text>{receiver || "_________________________"}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.row}>
            <Text style={[styles.cell, styles.cellHeader, { flex: 0.5 }]}>Item No.</Text>
            <Text style={[styles.cell, styles.cellHeader, { flex: 0.8 }]}>Qty</Text>
            <Text style={[styles.cell, styles.cellHeader, { flex: 0.8 }]}>Unit</Text>
            <Text style={[styles.cell, styles.cellHeader, { flex: 1 }]}>HS Code</Text>
            <Text style={[styles.cell, styles.cellHeader, { flex: 2 }]}>Description</Text>
            <Text style={[styles.cell, styles.cellHeader, { flex: 1 }]}>Weight (kgs)</Text>
            <Text style={[styles.cell, styles.cellHeader, { flex: 1.2 }]}>Dimensions</Text>
          </View>
          {/* Rows */}
          {items.map((item, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{idx + 1}</Text>
              <Text style={[styles.cell, { flex: 0.8 }]}>{item.qty || "1"}</Text>
              <Text style={[styles.cell, { flex: 0.8 }]}>pcs</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{item.hsCode || ""}</Text>
              <Text style={[styles.cell, styles.cellDesc, { flex: 2 }]}>{item.description || item.name || ""}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{item.weight || ""}</Text>
              <Text style={[styles.cell, { flex: 1.2 }]}>{item.dimensions || ""}</Text>
            </View>
          ))}
        </View>

        {/* Summary fields */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Packages:</Text>
          <Text style={styles.summaryValue}>{totalPackages}</Text>
          <Text style={styles.summaryLabel}>Total Quantity:</Text>
          <Text style={styles.summaryValue}>{totalQuantity}</Text>
          <Text style={styles.summaryLabel}>Total Weight:</Text>
          <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} kgs</Text>
        </View>

        {/* Signature and Company details */}
        <View style={styles.signatureSection}>
          <View style={{ width: "10%" }} />
          <View style={styles.signatureBox}>
            <Image source={Seal} style={{ width: 200, height: 200, marginBottom: 1 }} />
        <Text style={styles.companyDetails}>
          Axess Middle East DMCC
        </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const CiplTemplate = () => {
  const location = useLocation();
  const {
    selectedItems = []
  } = location.state || {};
  const [projectName, setProjectName] = useState("");
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [date, setDate] = useState("");
  const [quoteNo, setQuoteNo] = useState("");
  const [items, setItems] = useState(
    selectedItems.map(item => ({ ...item, qty: "1", weight: "", dimensions: "" }))
  );

  // Update item details
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Generate CIPL</h2>

      {/* Project Name */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      {/* Sender / Receiver */}
      <div className="flex gap-4 mb-4">
        <textarea
          placeholder="Sender Address"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className="border p-2 flex-1"
          rows={3}
        />
        <textarea
          placeholder="Receiver Address"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="border p-2 flex-1"
          rows={3}
        />
      </div>

      {/* PO Number */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="PO Number"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      {/* Quote No */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Quote No."
          value={quoteNo}
          onChange={(e) => setQuoteNo(e.target.value)}
          className="border p-2 w-full"
        />
      </div>

      {/* Item Table */}
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Asset ID</th>
            <th className="border p-2">HS Code</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Weight (kg)</th>
            <th className="border p-2">Dimensions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.id}</td>
              <td className="border p-2">{item.hsCode}</td>
              <td className="border p-2">{item.description}</td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(idx, "qty", e.target.value)}
                  className="border p-1 w-16"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => updateItem(idx, "weight", e.target.value)}
                  className="border p-1 w-20"
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={item.dimensions}
                  onChange={(e) => updateItem(idx, "dimensions", e.target.value)}
                  className="border p-1 w-32"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDF Download */}
      <PDFDownloadLink
        document={<CiplPDF items={items} sender={sender} receiver={receiver} projectName={projectName} poNumber={poNumber} date={date} quoteNo={quoteNo} />}
        fileName={`CIPL_${projectName}.pdf`}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {({ loading }) => (loading ? "Preparing PDF..." : "Download CIPL PDF")}
      </PDFDownloadLink>
    </div>
  );
};

export default CiplTemplate;