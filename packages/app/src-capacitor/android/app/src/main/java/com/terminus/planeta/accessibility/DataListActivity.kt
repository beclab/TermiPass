package com.terminus.planeta.accessibility

import android.content.Context
import android.os.*
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.terminus.planeta.R
import com.terminus.planeta.databinding.ActivityDatalistBinding

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/02/03
 *     desc   :
 *     version: 1.0
 * </pre>
 */
class DataListActivity : AppCompatActivity() {

    private lateinit var mBinding: ActivityDatalistBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        mBinding = ActivityDatalistBinding.inflate(layoutInflater)
        setContentView(mBinding.root)

        val dataList = mutableListOf<AppCredential>()
        dataList.add(AppCredential( "https://github.com", "icebergtsn", "xxxxxx"))
        var resultList = dataList

        if (intent != null){
            val searchUri = intent.getStringExtra("uri")
            if (!searchUri.isNullOrEmpty())
                resultList = dataList.filter {
                if (it.url != null) searchUri.startsWith(it.url) else false
            }.toMutableList()
        }
        val adapter = ListAdapter(resultList, this)
        adapter.setOnItemClickListener(object : OnItemClickListener<AppCredential> {
            override fun onItemClick(t: AppCredential) {
//                setResult(
//                    RESULT_OK,
//                    Intent(this@DataListActivity, AccessibilityActivity::class.java).apply {
//                        this.putExtra("bean", t)
//                    })
//                finish()
            }
        })
        mBinding.txtSize.text = "${resultList.size}"
        mBinding.list.layoutManager = LinearLayoutManager(this)
        mBinding.list.adapter = adapter
        adapter.notifyDataSetChanged()
    }


    class ListAdapter(private val dataList: MutableList<AppCredential>, val context: Context) :
        RecyclerView.Adapter<ViewHolder>() {

        private var mListener: OnItemClickListener<AppCredential>? = null;

        fun setOnItemClickListener(listener: OnItemClickListener<AppCredential>?) {
            this.mListener = listener
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            return ViewHolder(
                LayoutInflater.from(context).inflate(R.layout.item_data_list, parent, false),
                mListener
            )
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            holder.onBind(dataList[position])
        }

        override fun getItemCount(): Int {
            return dataList.size
        }

    }

    interface OnItemClickListener<T> {

        fun onItemClick(t: T)
    }

    class ViewHolder(private val itemView: View, private val listener : OnItemClickListener<AppCredential>?) : RecyclerView.ViewHolder(itemView) {

        var name: TextView? = null
        var url: TextView? = null
        private var mAppCredential : AppCredential? = null

        init {
            url = itemView.findViewById(R.id.item_url)
            name = itemView.findViewById(R.id.item_usename)
            itemView.setOnClickListener{
                if (mAppCredential != null){
                    listener?.onItemClick(mAppCredential!!)
                }
            }
        }

        fun onBind(appCredential: AppCredential) {
            url?.text = if (appCredential.url != null && appCredential.url.isNotEmpty()) appCredential.url else ""
            name?.text = appCredential.userName
            mAppCredential = appCredential
        }
    }
}