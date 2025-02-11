import {
  imRtdSubmodule,
  storage,
  getCustomBidderFunction,
  setRealTimeData,
  getRealTimeData,
  getApiCallback,
  imUidLocalName,
  imVidCookieName,
  imRtdLocalName
} from 'modules/imRtdProvider.js'
import { timestamp } from '../../../src/utils.js'

describe('imRtdProvider', function () {
  let getLocalStorageStub;
  let getCookieStub;

  const testReqBidsConfigObj = {
    adUnits: [
      {
        bids: ['test1', 'test2']
      }
    ]
  };
  const onDone = function() { return true };
  const moduleConfig = {
    params: {
      cid: 5126,
      setGptKeyValues: true
    }
  }

  beforeEach(function (done) {
    getLocalStorageStub = sinon.stub(storage, 'getDataFromLocalStorage');
    getCookieStub = sinon.stub(storage, 'getCookie');
    done();
  });

  afterEach(function () {
    getLocalStorageStub.restore();
    getCookieStub.restore();
  });

  describe('imRtdSubmodule', function () {
    it('should initalise and return true', function () {
      expect(imRtdSubmodule.init()).to.equal(true)
    })
  })

  describe('getCustomBidderFunction', function () {
    it('should return config function', function () {
      const config = {
        params: {
          overwrites: {
            testBidder: function() {
              return 'testString';
            }
          }
        }
      };
      const bidder = 'testBidder'
      expect(getCustomBidderFunction(config, bidder)).to.exist.and.to.be.a('function');
      expect(getCustomBidderFunction(config, bidder)()).to.equal('testString');
    })
    it('should return null when overwrites falsy', function () {
      const config = {
        params: {
          overwrites: {
            testBidder: null
          }
        }
      };
      const bidder = 'testBidder'
      expect(getCustomBidderFunction(config, bidder)).to.equal(null);
    })
  })

  describe('processBidderFunction', function () {

  })

  describe('setRealTimeData', function () {
    it('should return true when empty params', function () {
      expect(setRealTimeData({adUnits: []}, {params: {}}, {im_segments: []})).to.equal(undefined)
    });
    it('should return true when overwrites and bid params', function () {
      const config = {
        params: {
          overwrites: {
            testBidder: function() { return true }
          }
        }
      };
      expect(setRealTimeData(testReqBidsConfigObj, config, {im_segments: []})).to.equal(undefined)
    });
  })

  describe('getRealTimeData', function () {
    it('should initalise and return when empty params', function () {
      expect(getRealTimeData({}, function() {}, {})).to.equal(undefined)
    });

    it('should initalise and return with config', function () {
      expect(getRealTimeData(testReqBidsConfigObj, onDone, moduleConfig)).to.equal(undefined)
    });

    it('should return the uid when sids(rtd) not expired', function () {
      getLocalStorageStub.withArgs(imUidLocalName).returns('testUid');
      getLocalStorageStub.withArgs(imRtdLocalName).returns('testSids');
      getCookieStub.withArgs(imVidCookieName).returns('testUid');
      getLocalStorageStub.withArgs(`${imRtdLocalName}_mt`).returns(new Date(timestamp()).toUTCString());
      expect(getRealTimeData(testReqBidsConfigObj, onDone, moduleConfig)).to.equal(undefined)
    });

    it('should return the uid when it exists uid, sids(rtd), vid in storages and sids(rtd) expired', function () {
      getLocalStorageStub.withArgs(imUidLocalName).returns('testUid');
      getLocalStorageStub.withArgs(imRtdLocalName).returns('testSids');
      getCookieStub.withArgs(imVidCookieName).returns('testUid');
      getLocalStorageStub.withArgs(`${imRtdLocalName}_mt`).returns(0);
      expect(getRealTimeData(testReqBidsConfigObj, onDone, moduleConfig)).to.equal(undefined)
    });

    it('should return the uid when uid not expired', function () {
      getLocalStorageStub.withArgs(imUidLocalName).returns('testUid');
      getLocalStorageStub.withArgs(imRtdLocalName).returns('testSids');
      getCookieStub.withArgs(imVidCookieName).returns('testUid');
      getLocalStorageStub.withArgs(`${imUidLocalName}_mt`).returns(new Date(timestamp()).toUTCString());
      expect(getRealTimeData(testReqBidsConfigObj, onDone, moduleConfig)).to.equal(undefined)
    });
  })

  describe('getApiCallback', function () {
    it('should return success and error functions', function () {
      const res = getApiCallback(testReqBidsConfigObj, false, moduleConfig);
      expect(res.success).to.exist.and.to.be.a('function');
      expect(res.error).to.exist.and.to.be.a('function');
    });

    it('should return "undefined" success', function () {
      const res = getApiCallback(testReqBidsConfigObj, false, moduleConfig);
      const successResponse = '{"uid": "testid", "segments": "testsegment", "vid": "testvid"}';
      expect(res.success(successResponse, {status: 200})).to.equal(undefined);
      expect(res.error()).to.equal(undefined);
    });

    it('should return "undefined" catch error response', function () {
      const res = getApiCallback(testReqBidsConfigObj, false, moduleConfig);
      expect(res.success('error response', {status: 400})).to.equal(undefined);
    });
  })
})
