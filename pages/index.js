import Map from "../components/index/map_component";
import LeftButtons from "../components/index/buttons_component";
import TableComponent from "../components/index/table.component";
import FileUploadForm from "../components/index/upload_file";
import { useState, useEffect } from "react";
import Parcel from "../models/parcel";
import dbConnect from "../utils/mongoose";

export default function Index({
  opstineSrednjeno,
  data,
  firmeArray,
  opstinePocetno,
}) {
  const [firme, setFirme] = useState(data);
  const [opstine, setOpstine] = useState(opstineSrednjeno);
  const handleCheckClick = (e) => {
    let newFirme = { ...firme };
    newFirme[e]["active"] = !newFirme[e].active;
    setFirme(newFirme);
  };
  useEffect(() => {
    let newOpstine = makeOpstineFromFirme(firme, opstinePocetno);
    setOpstine(newOpstine);
  }, [firme, opstinePocetno]);
  console.log("Opstine:", opstine);
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-row flex-1">
        <LeftButtons
          handleCheckClick={handleCheckClick}
          firme={firme}
          firmeArray={firmeArray}
        />
        <Map opstine={opstine} />
      </div>

      <div className="flex flex-col flex-1">
        <FileUploadForm />
        <TableComponent firme={firme} firmeArray={firmeArray} />
      </div>
    </div>
  );
}

const makeOpstineFromFirme = (firme, opstine) => {
  // opstine: [
  //  { _id: { opstina: 'Sečanj', vlasnistvo: 'Đ.N.' }, sum: 116094 },
  //  { _id: { opstina: 'Sečanj', vlasnistvo: 'Ribnjak Sutjeska' },
  //  sum: 9202252
  //} Vlsnisto sum: [
  // { _id: 'Đ.N.', sum: 975848, selected: true },
  // { _id: 'Greenco Eko Park', sum: 902694, selected: true },
  let firmeArray = Object.keys(firme);
  let opstineSrednjeno = {};
  opstine.map((o, index) => {
    if (firme[o._id["vlasnistvo"]]["active"]) {
      if (opstineSrednjeno[o._id["opstina"]]) {
        if (opstineSrednjeno[o._id["opstina"]]["vlasnici"][o._id]) {
          opstineSrednjeno[o._id["opstina"]].sum += o.sum;
          opstineSrednjeno[o._id["opstina"]]["vlasnici"][o._id.vlasnistvo] +=
            o.sum;
        } else {
          opstineSrednjeno[o._id["opstina"]]["vlasnici"][o._id.vlasnistvo] =
            o.sum;
          opstineSrednjeno[o._id["opstina"]].sum += o.sum;
        }
      } else {
        opstineSrednjeno[o._id["opstina"]] = {
          sum: o.sum,
          vlasnici: { [`${o._id.vlasnistvo}`]: o.sum },
        };
      }
    } else {
    }
  });
  return opstineSrednjeno;
};

export async function getStaticProps(context) {
  await dbConnect();
  const parcels = await Parcel.find({});
  let vlasnistvoSum = await Parcel.aggregate([
    { $group: { _id: "$vlasnistvo", sum: { $sum: "$povrsina" } } },
    { $sort: { _id: -1 } },
  ]);
  let firme = {};
  let firmeArray = [];

  vlasnistvoSum.map((e) => {
    firme[e._id] = { active: true };
    firme[e._id]["sum"] = e.sum;
    firmeArray.push(e._id);
  });
  let opstinePocetno = await Parcel.aggregate([
    {
      $group: {
        _id: { opstina: "$opstina", vlasnistvo: "$vlasnistvo" },
        sum: { $sum: "$povrsina" },
      },
    },
  ]);
  const opstineSrednjeno = makeOpstineFromFirme(firme, opstinePocetno);
  return {
    props: {
      vlasnistvoSum: vlasnistvoSum,
      opstineSrednjeno: opstineSrednjeno,
      firmeArray: firmeArray,
      data: firme,
      opstinePocetno: opstinePocetno,
    },
  };
}
