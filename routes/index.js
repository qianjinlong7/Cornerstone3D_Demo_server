var express = require('express')
var router = express.Router()
const connection = require('../db/db_connect')
const fs = require('fs')

const loadImages = (outputpath) => {  // 加载Listbody中所选项对应的文件名数组
  let series = []
  let ct_in = outputpath.split('_')[1]
  //let folders = [outputpath + sep + 'PET_in', outputpath + sep + 'PET_out', '/home/radyn/.config/RaDynNucCAD/config/input/NNUNET/NNUNET_'+ct_in+'_CT']
  let folders = [outputpath + sep + 'PET_in', outputpath + sep + 'PET_out', outputpath + sep + 'CT_out']
  for (let i = 0; i < folders.length; i++) {
    let viewpath = folders[i]   // ‘.../PET_in’ || '.../PET_out' || '.../CT_out'
    let filespath = fs.readdirSync(viewpath)  // 读取viewpath下的各个文件名，并返回读取到的结果
    let map = {}
    let arr = []
    let imageIds = []
    let temp_content = fs.readFileSync(viewpath + sep + filespath[0]);
    let temp_contentParsed = dicomParser.parseDicom(temp_content);
    let modality = temp_contentParsed.string('x00080060');
    for (let i = 0; i < filespath.length; i++) {
      let content = fs.readFileSync(viewpath + '/' + filespath[i]);
      let contentParsed = dicomParser.parseDicom(content);
      let instancenum = contentParsed.string('x00200013');
      map[instancenum] = i;
      arr[i] = instancenum;
    }
    arr.sort(function (a, b) { return a - b })
    let arrp = []
    for (let i = 0; i < arr.length; i++) {
      let k = arr[i];
      arrp[i] = 'wadouri:file:///' + viewpath + sep + filespath[map[k]];
      imageIds[i] = arrp[i]
    }
    if (modality === 'PT') {
      const InstanceMetadataArray = [];
      imageIds.forEach((imageId) => {
        //const instanceMetadata = getPTImageIdInstanceMetadata(imageId);
        const correctedImage = temp_contentParsed.string('x00280051')
        const units = temp_contentParsed.string('x00541001')
        const radionuclideHalfLife = temp_contentParsed.elements.x00540016.items[0].dataSet.string('x00181072')
        const radionuclideTotalDose = temp_contentParsed.elements.x00540016.items[0].dataSet.string('x00181074')
        const decayCorrection = temp_contentParsed.string('x00541102')
        const patientWeight = temp_contentParsed.string('x00101030')
        const seriesDate = temp_contentParsed.string('x00080021')
        const seriesTime = temp_contentParsed.string('x00080031')
        const acquisitionDate = temp_contentParsed.string('x00080022')
        const acquisitionTime = temp_contentParsed.string('x00080032')
        const actualFrameDuration = temp_contentParsed.string('x00181242')
        const patientSex = temp_contentParsed.string('x00100040')
        const patientSize = temp_contentParsed.string('x00101020')
        const radiopharmaceuticalStartTime = temp_contentParsed.elements.x00540016.items[0].dataSet.string('x00181072')
        const instanceMetadata = {
          CorrectedImage: correctedImage,
          Units: units,
          RadionuclideHalfLife: radionuclideHalfLife,
          RadionuclideTotalDose: radionuclideTotalDose,
          DecayCorrection: decayCorrection,
          PatientWeight: patientWeight,
          SeriesDate: seriesDate,
          SeriesTime: seriesTime,
          AcquisitionDate: acquisitionDate,
          AcquisitionTime: acquisitionTime,
          ActualFrameDuration: actualFrameDuration,
          PatientSex: patientSex,
          PatientSize: patientSize,
          RadiopharmaceuticalStartTime: radiopharmaceuticalStartTime,
        };
        if (typeof instanceMetadata.CorrectedImage === 'string') {
          instanceMetadata.CorrectedImage =
            instanceMetadata.CorrectedImage.split('\\');
        }

        if (instanceMetadata) {
          InstanceMetadataArray.push(instanceMetadata);
        }
      });
      if (InstanceMetadataArray.length) {
        const suvScalingFactors = calculateSUVScalingFactors(
          InstanceMetadataArray
        );
        InstanceMetadataArray.forEach((instanceMetadata, index) => {
          ptScalingMetaDataProvider.addInstance(
            imageIds[index],
            suvScalingFactors[index]
          );
        });
      }
    }
    series.push(imageIds)
  }
  return series
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/getPatientList', (req, res) => {
  const SQL = 'SELECT * FROM patients;'
  connection.query(SQL, (err, results) => {
    if (err) throw err
    res.send(results)
  })
})

router.post('/getDICOM', (req, res) => {
  const { dicomPath } = req

})

module.exports = router
